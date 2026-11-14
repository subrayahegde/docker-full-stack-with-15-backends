-module(product_handler).
-behavior(cowboy_rest).

%% Cowboy REST Callbacks
-export([
    init/2,
    allowed_methods/2,
    options/2,
    malformed_request/2,
    resource_exists/2,
    content_types_provided/2,
    content_types_accepted/2,
    delete_resource/2
]).

%% Custom Content Callbacks
-export([to_json/2, from_json/2]).

%% 1. Attach CORS headers to every incoming request right at initialization
init(Req, State) ->
    ReqWithCors = set_cors_headers(Req),
    {cowboy_rest, ReqWithCors, State}.

%% 2. Include <<"OPTIONS">> for browser CORS preflight checks
allowed_methods(Req, State) ->
    {[<<"GET">>, <<"POST">>, <<"PUT">>, <<"DELETE">>, <<"OPTIONS">>], Req, State}.

%% 3. Handle CORS preflight OPTIONS requests immediately with 200 OK
options(Req, State) ->
    {ok, Req, State}.

%% 4. Parse ID and validate JSON body (skip validation for OPTIONS)
malformed_request(Req, State) ->
    Method = cowboy_req:method(Req),
    case Method of
        <<"OPTIONS">> ->
            {false, Req, State#{method => Method}};
        _ ->
            RawId = cowboy_req:binding(id, Req),
            case parse_id(RawId) of
                error ->
                    {true, Req, State};
                Id ->
                    State1 = State#{id => Id, method => Method},
                    validate_body(Method, Req, State1)
            end
    end.

validate_body(M, Req, State) when M =:= <<"POST">>; M =:= <<"PUT">> ->
    {ok, RawBody, Req1} = cowboy_req:read_body(Req),
    try json:decode(RawBody) of
        #{<<"name">> := Name, <<"price">> := Price} = Map when is_binary(Name), is_number(Price) ->
            {false, Req1, State#{body => Map}};
        _ ->
            {true, Req1, State}
    catch
        _:_ -> {true, Req1, State}
    end;
validate_body(_, Req, State) ->
    {false, Req, State}.

%% 5. Check if resource exists in Postgres
resource_exists(Req, #{id := undefined, method := <<"GET">>} = State) ->
    {true, Req, State};
resource_exists(Req, #{id := undefined, method := <<"POST">>} = State) ->
    {false, Req, State};
resource_exists(Req, #{id := undefined} = State) ->
    {false, Req, State};
resource_exists(Req, #{id := Id} = State) ->
    Sql = "SELECT id, name, description, price, created_at FROM products WHERE id = $1",
    case pg_worker:equery(Sql, [Id]) of
        {ok, _Cols, [Row]} ->
            {true, Req, State#{product => row_to_map(Row)}};
        {ok, _Cols, []} ->
            {false, Req, State}
    end.

content_types_provided(Req, State) ->
    {[{{<<"application">>, <<"json">>, '*'}, to_json}], Req, State}.

content_types_accepted(Req, State) ->
    {[{{<<"application">>, <<"json">>, '*'}, from_json}], Req, State}.

%% GET /api/products or GET /api/products/:id
to_json(Req, #{id := undefined} = State) ->
    Sql = "SELECT id, name, description, price, created_at FROM products ORDER BY id ASC",
    {ok, _Cols, Rows} = pg_worker:equery(Sql, []),
    Products = [row_to_map(R) || R <- Rows],
    {iolist_to_binary(json:encode(Products)), Req, State};
to_json(Req, #{product := Product} = State) ->
    {iolist_to_binary(json:encode(Product)), Req, State}.

%% POST (Create) and PUT (Update)
from_json(Req, #{method := <<"POST">>, body := Body} = State) ->
    Name = maps:get(<<"name">>, Body),
    Desc = maps:get(<<"description">>, Body, null),
    Price = maps:get(<<"price">>, Body),

    Sql = "INSERT INTO products (name, description, price) "
          "VALUES ($1, $2, $3) "
          "RETURNING id, name, description, price, created_at",
    {ok, 1, _Cols, [Row]} = pg_worker:equery(Sql, [Name, Desc, Price]),

    ProductMap = row_to_map(Row),
    NewId = integer_to_binary(maps:get(<<"id">>, ProductMap)),
    Location = <<"/api/products/", NewId/binary>>,

    Req1 = cowboy_req:set_resp_body(iolist_to_binary(json:encode(ProductMap)), Req),
    {{created, Location}, Req1, State};

from_json(Req, #{method := <<"PUT">>, id := Id, body := Body} = State) ->
    Name = maps:get(<<"name">>, Body),
    Desc = maps:get(<<"description">>, Body, null),
    Price = maps:get(<<"price">>, Body),

    Sql = "UPDATE products SET name = $1, description = $2, price = $3 "
          "WHERE id = $4 "
          "RETURNING id, name, description, price, created_at",
    {ok, 1, _Cols, [Row]} = pg_worker:equery(Sql, [Name, Desc, Price, Id]),

    ProductMap = row_to_map(Row),
    Req1 = cowboy_req:set_resp_body(iolist_to_binary(json:encode(ProductMap)), Req),
    {true, Req1, State}.

%% DELETE /api/products/:id
delete_resource(Req, #{id := Id} = State) ->
    Sql = "DELETE FROM products WHERE id = $1",
    {ok, _Count} = pg_worker:equery(Sql, [Id]),
    {true, Req, State}.

%% --- CORS & Internal Helper Functions ---

set_cors_headers(Req) ->
    Origin = list_to_binary(os:getenv("CORS_ORIGIN", "http://localhost:3000")),
    Headers = #{
        <<"access-control-allow-origin">> => Origin,
        <<"access-control-allow-methods">> => <<"GET, POST, PUT, DELETE, OPTIONS">>,
        <<"access-control-allow-headers">> => <<"content-type, authorization">>,
        <<"access-control-max-age">> => <<"86400">>
    },
    cowboy_req:set_resp_headers(Headers, Req).

parse_id(undefined) -> undefined;
parse_id(Bin) ->
    try binary_to_integer(Bin) of
        Int when Int > 0 -> Int;
        _ -> error
    catch
        _:_ -> error
    end.

row_to_map({Id, Name, Desc, Price, CreatedAt}) ->
    #{
        <<"id">> => Id,
        <<"name">> => Name,
        <<"description">> => Desc,
        <<"price">> => format_numeric(Price),
        <<"created_at">> => format_timestamp(CreatedAt)
    }.

format_numeric(Bin) when is_binary(Bin) ->
    binary_to_float(Bin);
format_numeric(Num) ->
    Num.

format_timestamp({{Y, M, D}, {H, Min, Sec}}) ->
    SecInt = trunc(Sec),
    Str = io_lib:format("~4..0B-~2..0B-~2..0BT~2..0B:~2..0B:~2..0BZ",
                        [Y, M, D, H, Min, SecInt]),
    iolist_to_binary(Str).

