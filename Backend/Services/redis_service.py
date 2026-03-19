import redis.asyncio as redis
import os
import dotenv
dotenv.load_dotenv()



class RedisService:
    _client = None

    @classmethod
    def get_client(cls):
        if cls._client is None:
            redis_url = os.getenv("REDIS_URL")

            # ✅ Use full URL (BEST for cloud)
            if redis_url:
                cls._client = redis.from_url(
                    redis_url,
                    decode_responses=True
                )
            else:
                # fallback (local dev)
                host = os.getenv("REDIS_HOST")
                port = int(os.getenv("REDIS_PORT"))
                password = os.getenv("REDIS_PASSWORD")

                cls._client = redis.Redis(
                    host=host,
                    port=port,
                    password=password,
                    decode_responses=True,
                )

        return cls._client

    @classmethod
    async def set_value(cls, name: str, value: str, ex: int):
        client = cls.get_client()
        try:
            await client.set(name=name, value=value, ex=ex)
        except Exception as e:
            print(f"Error setting value in Redis: {e}")

    @classmethod
    async def get_value(cls, name: str):
        client = cls.get_client()
        try:
            return await client.get(name=name)
        except Exception as e:
            print(f"Error getting value from Redis: {e}")
            return None

    @classmethod
    async def delete_value(cls, name: str):
        client = cls.get_client()
        try:
            await client.delete(name)
            return True
        except Exception as e:
            print(f"Error deleting value from Redis: {e}")
            return False