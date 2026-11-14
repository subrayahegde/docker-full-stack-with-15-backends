-module(my_shop_app).
-behaviour(application).

-export([start/2, stop/1]).

start(_Type, _Args) ->
    Port = list_to_integer(os:getenv("PORT", "5000")),
    Dispatch = cowboy_router:compile([
        {'_', [
            {"/api/products/[:id]", product_handler, #{}}
        ]}
    ]),
    {ok, _} = cowboy:start_clear(http_listener,
        [{port, Port}],
        #{env => #{dispatch => Dispatch}}
    ),
    my_shop_sup:start_link().

stop(_State) ->
    cowboy:stop_listener(http_listener).

