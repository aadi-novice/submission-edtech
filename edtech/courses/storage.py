import os, time
from supabase import create_client
from django.conf import settings

_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE)

def upload_bytes(path_in_bucket: str, data: bytes, bucket: str = None):
    bucket = bucket or settings.SUPABASE_BUCKET
    # overwrite if exists
    _client.storage.from_(bucket).upload(path_in_bucket, data, {"upsert": True})
    return path_in_bucket

def signed_url(path_in_bucket: str, expires_sec: int = 60, bucket: str = None) -> str:
    bucket = bucket or settings.SUPABASE_BUCKET
    res = _client.storage.from_(bucket).create_signed_url(path_in_bucket, expires_sec)
    return res.get("signedURL") or res.get("signed_url")
