# Multi-Paradigm WebRTC Signal server

[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)

A multi-paradigm signal server meant to work with kurento media server.  
It can work in two modes as a standalone signaling server when used with websockets, Or with AWS Websocktest when used as REST API.  

## Usage

### To Run The API

- make sure the .env file is set
- make sure you have nodejs version 16 at least
- run the following commands

```sh
make install
make dev
```

- Open your browser on <a href="http://localhost:3000/docs" target="_blank">Api Docs</a> for swagger

### To Run Tests

```sh
make test
```

## ToDo

- [x] create basic functionality to support streaming (SDP and ICE exchange endpoints)
- [x] add uri versioning
- [x] add custom logger interceptor
- [ ] fix issues with horizontal scaling, cache sessions with redis
