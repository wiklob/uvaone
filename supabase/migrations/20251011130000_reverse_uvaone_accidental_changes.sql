-- SYNC MIGRATION: Add missing tables to match database state
-- This migration adds tables that exist in the database but are missing from migrations
-- These tables are: profiles, teams, team_members, team_invitations, companies, user_companies

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SYNC MIGRATION FOR UVAONE-DB';
    RAISE NOTICE 'Adding missing table definitions';
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- STEP 1: Create profiles table if it doesn't exist
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            email TEXT UNIQUE NOT NULL,
            first_name TEXT,
            last_name TEXT,
            avatar_url TEXT,
            role TEXT DEFAULT 'student' CHECK (role IN ('student', 'tutor', 'admin')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created table: profiles';
    ELSE
        RAISE NOTICE 'Table profiles already exists, skipping';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Create companies table if it doesn't exist
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'companies') THEN
        CREATE TABLE companies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_name TEXT NOT NULL,
            description TEXT,
            logo_url TEXT,
            website TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'Created table: companies';
    ELSE
        RAISE NOTICE 'Table companies already exists, skipping';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Create teams table if it doesn't exist
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'teams') THEN
        CREATE TABLE teams (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            team_name TEXT NOT NULL,
            team_type TEXT NOT NULL,
            company_id UUID REFERENCES companies(id),
            team_code TEXT UNIQUE NOT NULL,
            company_name TEXT,
            contact_person_id UUID REFERENCES profiles(id),
            contact_first_name TEXT NOT NULL,
            contact_last_name TEXT NOT NULL,
            contact_email TEXT NOT NULL,
            contact_position TEXT,
            contact_company TEXT,
            created_by UUID NOT NULL REFERENCES profiles(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'Created table: teams';
    ELSE
        RAISE NOTICE 'Table teams already exists, skipping';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: Create team_members table if it doesn't exist
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_members') THEN
        CREATE TABLE team_members (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            team_id UUID NOT NULL REFERENCES teams(id),
            user_id UUID NOT NULL REFERENCES profiles(id),
            role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created table: team_members';
    ELSE
        RAISE NOTICE 'Table team_members already exists, skipping';
    END IF;
END $$;

-- ============================================================================
-- STEP 5: Create team_invitations table if it doesn't exist
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_invitations') THEN
        CREATE TABLE team_invitations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            team_id UUID NOT NULL REFERENCES teams(id),
            email TEXT NOT NULL,
            invited_by UUID NOT NULL REFERENCES profiles(id),
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
            invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
        );
        RAISE NOTICE 'Created table: team_invitations';
    ELSE
        RAISE NOTICE 'Table team_invitations already exists, skipping';
    END IF;
END $$;

-- ============================================================================
-- STEP 6: Create user_companies table if it doesn't exist
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_companies') THEN
        CREATE TABLE user_companies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES profiles(id),
            company_id UUID NOT NULL REFERENCES companies(id),
            position TEXT NOT NULL,
            is_primary BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created table: user_companies';
    ELSE
        RAISE NOTICE 'Table user_companies already exists, skipping';
    END IF;
END $$;

-- ============================================================================
-- FINAL REPORT
-- ============================================================================

DO $$
DECLARE
    existing_tables TEXT;
BEGIN
    -- List tables that now exist
    SELECT string_agg(tablename, ', ')
    INTO existing_tables
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'teams', 'team_members', 'team_invitations',
                      'companies', 'user_companies');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SYNC MIGRATION COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables synchronized: %', COALESCE(existing_tables, 'none');
    RAISE NOTICE 'Database schema now matches migration state';
END $$;
