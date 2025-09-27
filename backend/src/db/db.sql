-- Database: social_app

-- DROP DATABASE IF EXISTS social_app;

-- CREATE DATABASE social_app
--     WITH
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'English_United States.1252'
--     LC_CTYPE = 'English_United States.1252'
--     LOCALE_PROVIDER = 'libc'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1
--     IS_TEMPLATE = False;

-- Create database (run this separately if needed)
-- CREATE DATABASE social_media_app;

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments table (replies to posts)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_is_deleted ON posts(is_deleted);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_is_deleted ON comments(is_deleted);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Full-text search indexes for content searching
CREATE INDEX idx_posts_content_search ON posts USING gin(to_tsvector('english', content));
CREATE INDEX idx_users_search ON users USING gin(to_tsvector('english', username || ' ' || full_name || ' ' || COALESCE(display_name, '')));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to soft delete posts
CREATE OR REPLACE FUNCTION soft_delete_post(
    p_post_id UUID,
    p_deleted_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE posts 
    SET is_deleted = true, 
        deleted_at = CURRENT_TIMESTAMP,
        deleted_by = p_deleted_by
    WHERE id = p_post_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to soft delete comments
CREATE OR REPLACE FUNCTION soft_delete_comment(
    p_comment_id UUID,
    p_deleted_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE comments 
    SET is_deleted = true, 
        deleted_at = CURRENT_TIMESTAMP,
        deleted_by = p_deleted_by
    WHERE id = p_comment_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Add edited_by column to posts table
ALTER TABLE posts ADD COLUMN edited_by UUID REFERENCES users(id);

-- Add edited_by column to comments table  
ALTER TABLE comments ADD COLUMN edited_by UUID REFERENCES users(id);

-- Create indexes for better performance
CREATE INDEX idx_posts_edited_by ON posts(edited_by);
CREATE INDEX idx_comments_edited_by ON comments(edited_by);

