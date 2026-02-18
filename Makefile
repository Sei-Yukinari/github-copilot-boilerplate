.PHONY: up down restart logs db migrate setup dev

# DBのみ起動（開発時はNext.jsをローカルで動かす）
up:
	docker compose up -d db

# 全サービス起動（appコンテナ含む）
up-all:
	docker compose up -d

# 全サービス停止
down:
	docker compose down

# 再起動
restart:
	docker compose restart

# ログ確認
logs:
	docker compose logs -f

# DBログのみ
logs-db:
	docker compose logs -f db

# DBコンテナに入る
db:
	docker compose exec db psql -U postgres -d hn_translate

# Prismaマイグレーション実行
migrate:
	npx prisma migrate dev

# Prisma Client生成
generate:
	npx prisma generate

# 初回セットアップ（DB起動 → マイグレーション）
setup: up
	@echo "Waiting for DB to be ready..."
	@sleep 3
	npx prisma migrate dev

# 開発サーバー起動（DB起動 + Next.js）
dev: up
	npm run dev
