from setuptools import setup, find_packages

setup(
    name='ProductivityApp_New',
    version='0.1',
    packages=find_packages(),
    install_requires=[
        'fastapi',
        'sqlalchemy',
        'alembic',
        'uvicorn',
        'pydantic'
    ]
)
