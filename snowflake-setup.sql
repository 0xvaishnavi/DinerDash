-- ============================================================
-- Diner Dash — Snowflake Setup Queries
-- Run these in order in the Snowflake SQL Worksheet
-- Account: pecwszp-dinerdash
-- ============================================================

-- 1. Create warehouse (if not already created)
CREATE WAREHOUSE IF NOT EXISTS COMPUTE_WH
  WITH WAREHOUSE_SIZE = 'XSMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE;

USE WAREHOUSE COMPUTE_WH;

-- 2. Create database
CREATE DATABASE IF NOT EXISTS DINER_DASH;
USE DATABASE DINER_DASH;

-- 3. Create schema
CREATE SCHEMA IF NOT EXISTS GAME_EVENTS;
USE SCHEMA GAME_EVENTS;

-- 4. Create the raw events table
CREATE TABLE IF NOT EXISTS RAW_EVENTS (
  EVENT_ID       VARCHAR(36)    NOT NULL,
  SESSION_ID     VARCHAR(36)    NOT NULL,
  LEVEL          INTEGER        NOT NULL,
  TIMESTAMP      TIMESTAMP_NTZ  NOT NULL,
  EVENT_NAME     VARCHAR(50)    NOT NULL,
  PAYLOAD        VARIANT        NOT NULL,
  INSERTED_AT    TIMESTAMP_NTZ  DEFAULT CURRENT_TIMESTAMP()
);

-- 5. Create views for analytics

-- Session overview
CREATE OR REPLACE VIEW V_SESSIONS AS
SELECT
  SESSION_ID,
  MIN(TIMESTAMP)                             AS SESSION_START,
  MAX(TIMESTAMP)                             AS SESSION_END,
  TIMESTAMPDIFF('second', MIN(TIMESTAMP), MAX(TIMESTAMP)) AS DURATION_SEC,
  COUNT(*)                                   AS TOTAL_EVENTS,
  MAX(LEVEL)                                 AS MAX_LEVEL_PLAYED
FROM RAW_EVENTS
GROUP BY SESSION_ID;

-- Order serve performance
CREATE OR REPLACE VIEW V_ORDER_SERVES AS
SELECT
  EVENT_ID,
  SESSION_ID,
  LEVEL,
  TIMESTAMP,
  PAYLOAD:order_id::STRING       AS ORDER_ID,
  PAYLOAD:dish_name::STRING      AS DISH_NAME,
  PAYLOAD:serve_time_ms::INTEGER AS SERVE_TIME_MS,
  PAYLOAD:speed_tier::STRING     AS SPEED_TIER,
  PAYLOAD:coins::INTEGER         AS COINS,
  PAYLOAD:reputation::INTEGER    AS REPUTATION
FROM RAW_EVENTS
WHERE EVENT_NAME = 'order_served';

-- Level completions
CREATE OR REPLACE VIEW V_LEVEL_COMPLETIONS AS
SELECT
  EVENT_ID,
  SESSION_ID,
  LEVEL,
  TIMESTAMP,
  PAYLOAD:total_coins::INTEGER      AS TOTAL_COINS,
  PAYLOAD:total_reputation::INTEGER AS TOTAL_REPUTATION,
  PAYLOAD:orders_served::INTEGER    AS ORDERS_SERVED,
  PAYLOAD:orders_expired::INTEGER   AS ORDERS_EXPIRED,
  PAYLOAD:stars_earned::INTEGER     AS STARS_EARNED
FROM RAW_EVENTS
WHERE EVENT_NAME = 'level_completed';

-- Customer arrivals & satisfaction
CREATE OR REPLACE VIEW V_CUSTOMERS AS
SELECT
  e1.SESSION_ID,
  e1.LEVEL,
  e1.PAYLOAD:customer_id::STRING       AS CUSTOMER_ID,
  e1.PAYLOAD:customer_type::STRING     AS CUSTOMER_TYPE,
  e1.TIMESTAMP                          AS ARRIVED_AT,
  e2.PAYLOAD:left_reason::STRING       AS LEFT_REASON,
  e2.PAYLOAD:satisfaction_score::INTEGER AS SATISFACTION_SCORE,
  e2.TIMESTAMP                          AS LEFT_AT
FROM RAW_EVENTS e1
LEFT JOIN RAW_EVENTS e2
  ON e1.SESSION_ID = e2.SESSION_ID
  AND e1.PAYLOAD:customer_id::STRING = e2.PAYLOAD:customer_id::STRING
  AND e2.EVENT_NAME = 'customer_left'
WHERE e1.EVENT_NAME = 'customer_arrived';

-- Dish popularity
CREATE OR REPLACE VIEW V_DISH_POPULARITY AS
SELECT
  PAYLOAD:dish_name::STRING AS DISH_NAME,
  LEVEL,
  COUNT(*)                  AS TIMES_SERVED,
  AVG(PAYLOAD:serve_time_ms::INTEGER) AS AVG_SERVE_TIME_MS,
  SUM(PAYLOAD:coins::INTEGER)         AS TOTAL_COINS_EARNED
FROM RAW_EVENTS
WHERE EVENT_NAME = 'order_served'
GROUP BY PAYLOAD:dish_name::STRING, LEVEL;

-- Expired orders
CREATE OR REPLACE VIEW V_EXPIRED_ORDERS AS
SELECT
  EVENT_ID,
  SESSION_ID,
  LEVEL,
  TIMESTAMP,
  PAYLOAD:order_id::STRING              AS ORDER_ID,
  PAYLOAD:dishes_pending::ARRAY         AS DISHES_PENDING,
  PAYLOAD:reputation_lost::INTEGER      AS REPUTATION_LOST
FROM RAW_EVENTS
WHERE EVENT_NAME = 'order_expired';

-- Speed tier distribution
CREATE OR REPLACE VIEW V_SPEED_TIER_STATS AS
SELECT
  LEVEL,
  PAYLOAD:speed_tier::STRING AS SPEED_TIER,
  COUNT(*)                   AS COUNT,
  AVG(PAYLOAD:serve_time_ms::INTEGER) AS AVG_SERVE_TIME_MS,
  AVG(PAYLOAD:coins::INTEGER)         AS AVG_COINS
FROM RAW_EVENTS
WHERE EVENT_NAME = 'order_served'
GROUP BY LEVEL, PAYLOAD:speed_tier::STRING;
