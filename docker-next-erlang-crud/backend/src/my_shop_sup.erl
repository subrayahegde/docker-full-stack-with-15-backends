-module(my_shop_sup).
-behaviour(supervisor).

-export([start_link/0, init/1]).

start_link() ->
    supervisor:start_link({local, ?MODULE}, ?MODULE, []).

init([]) ->
    PoolArgs = [
        {name, {local, pg_pool}},
        {worker_module, pg_worker},
        {size, 10},
        {max_overflow, 5}
    ],
    DbArgs = #{
        host => os:getenv("DB_HOST", "database"),
        port => list_to_integer(os:getenv("DB_PORT", "5432")),
        username => os:getenv("DB_USER", "postgres"),
        password => os:getenv("DB_PASSWORD", "Pass123"),
        database => os:getenv("DB_NAME", "clidb")
    },
    PoolSpec = poolboy:child_spec(pg_pool, PoolArgs, DbArgs),
    {ok, {{one_for_one, 10, 10}, [PoolSpec]}}.

