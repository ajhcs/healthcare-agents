import pytest

def pytest_configure(config):
    config.addinivalue_line("markers", "integration: requires API key and makes real API calls")
