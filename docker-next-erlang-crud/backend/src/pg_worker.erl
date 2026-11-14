
-module(pg_worker).
-behaviour(gen_server).
-behaviour(poolboy_worker).

-export([start_link/1, squery/1, equery/2]).
-export([init/1, handle_call/3, handle_cast/2, handle_info/2, terminate/2]).

start_link(Args) ->
    gen_server:start_link(?MODULE, Args, []).

%% Public API to run parameterized queries via the pool
equery(Sql, Params) ->
    poolboy:transaction(pg_pool, fun(Worker) ->
        gen_server:call(Worker, {equery, Sql, Params})
    end).

squery(Sql) ->
    poolboy:transaction(pg_pool, fun(Worker) ->
        gen_server:call(Worker, {squery, Sql})
    end).

%% gen_server callbacks
init(#{host := Host, port := Port, username := User, password := Pass, database := Db}) ->
    process_flag(trap_exit, true),
    {ok, Conn} = epgsql:connect(#{
        host => Host,
        port => Port,
        username => User,
        password => Pass,
        database => Db
    }),
    {ok, #{conn => Conn}}.

handle_call({equery, Sql, Params}, _From, #{conn := Conn} = State) ->
    {reply, epgsql:equery(Conn, Sql, Params), State};
handle_call({squery, Sql}, _From, #{conn := Conn} = State) ->
    {reply, epgsql:squery(Conn, Sql), State}.

handle_cast(_Msg, State) -> {noreply, State}.
handle_info(_Info, State) -> {noreply, State}.

terminate(_Reason, #{conn := Conn}) ->
    epgsql:close(Conn),
    ok.
