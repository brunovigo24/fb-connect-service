-- MySQL schema for fb-connect-service
-- Charset/engine
SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Ensure database exists (adjust if needed)
-- CREATE DATABASE IF NOT EXISTS `fb_connect_service` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `fb_connect_service`;

-- users
CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- tokens
CREATE TABLE IF NOT EXISTS `tokens` (
  `id` CHAR(36) NOT NULL,
  `userId` CHAR(36) NOT NULL,
  `provider` VARCHAR(32) NOT NULL,
  `accessToken` TEXT NOT NULL,
  `refreshToken` TEXT NULL,
  `expiresAt` BIGINT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_tokens_userId` (`userId`),
  CONSTRAINT `FK_tokens_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- pages
CREATE TABLE IF NOT EXISTS `pages` (
  `id` CHAR(36) NOT NULL,
  `userId` CHAR(36) NOT NULL,
  `pageId` VARCHAR(64) NOT NULL,
  `pageName` VARCHAR(255) NULL,
  `pageAccessToken` TEXT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_pages_user_page` (`userId`, `pageId`),
  KEY `IDX_pages_userId` (`userId`),
  CONSTRAINT `FK_pages_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- clients
CREATE TABLE IF NOT EXISTS `clients` (
  `id` CHAR(36) NOT NULL,
  `clientId` VARCHAR(128) NOT NULL,
  `clientSecret` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `scopes` JSON NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_clients_clientId` (`clientId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


