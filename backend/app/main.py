from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router
from app.routes.she import router as she_router

app = FastAPI(title='Insurance / SHE Management API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router)
app.include_router(she_router)
app.include_router(admin_router)


@app.get('/health')
def health() -> dict:
    return {'status': 'ok'}
