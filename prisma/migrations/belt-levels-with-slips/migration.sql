-- Migration: Add belt levels with slips + extended black belt ranks
-- Adds: WIT_GEEL, GEEL_ORANJE, ORANJE_GROEN, GROEN_BLAUW, BLAUW_BRUIN, BRUIN
-- Adds: ZWART_1 through ZWART_10
-- Safe to run multiple times (checks existence before adding)

DO $$
BEGIN
  -- Slip levels (between main belts)
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'WIT_GEEL') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'WIT_GEEL';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'GEEL_ORANJE') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'GEEL_ORANJE';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'ORANJE_GROEN') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'ORANJE_GROEN';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'GROEN_BLAUW') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'GROEN_BLAUW';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'BLAUW_BRUIN') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'BLAUW_BRUIN';
  END IF;

  -- BRUIN (new simplified version, alongside BRUIN_1/2/3 legacy)
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'BRUIN') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'BRUIN';
  END IF;

  -- Extended black belt ranks (ZWART_1 through ZWART_10)
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'ZWART_1') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'ZWART_1';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'ZWART_2') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'ZWART_2';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'ZWART_3') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'ZWART_3';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'ZWART_4') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'ZWART_4';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'ZWART_5') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'ZWART_5';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'ZWART_6') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'ZWART_6';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'ZWART_7') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'ZWART_7';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'ZWART_8') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'ZWART_8';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'ZWART_9') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'ZWART_9';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = 'ZWART_10') THEN
    ALTER TYPE "BeltLevel" ADD VALUE 'ZWART_10';
  END IF;
END $$;
