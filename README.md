# VersionVault

![Screenshot of VersionVault](link-to-your-screenshot.png)

## Overview

VersionVault is a simple dashboard that provides a consolidated view of the update status for your Docker applications. Inspired by WUD (What's Up Docker), but with a different visual representation. I created this because I wanted a single pane of glass to monitor my homelab Docker apps more effectively.

**Disclaimer:** I'm not a programmer, just a homelab enthusiast. This project was created with the help of Claude 3.5 based on output from WUD's API.

## Features

-   Single-page dashboard displaying Docker application update statuses.
-   Connects to WUD's API to retrieve the latest version information.
-   Clear visual representation of which applications are up to date.
-   Light/Dark Mode support
-   Traefik integration for easy HTTPS access

## Prerequisites

-   Running instance of WUD (What's Up Docker) to provide the API.
-   Docker and Docker Compose
-   (Optional) Traefik for reverse proxy with HTTPS

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/gezuka77/versionvault.git
   cd versionvault


2. **Configure your environment**:

   Edit the `docker-compose.yml` file to set the `WUD_API_URL` environment variable to point to your WUD API endpoint:

   ```yaml
   environment:
     - WUD_API_URL=http://your-wud-server:3000/api/containers
   ```

3. **Configure Traefik (Optional)**:

   If you're using Traefik as a reverse proxy, the `docker-compose.yml` already includes the necessary labels. Update the domain name in the labels to match your environment:

   ```yaml
   labels:
     - traefik.http.routers.versionvault.rule=Host(`your-domain.example.com`)
     - traefik.http.routers.versionvault-secure.rule=Host(`your-domain.example.com`)
   ```

4. **Start the container**:

   ```bash
   docker-compose up -d
   ```

5. **Access the dashboard**:

   Open your browser and navigate to:
   - `http://localhost:2080` (if not using Traefik)
   - `https://your-domain.example.com` (if using Traefik with the configured domain)

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WUD_API_URL` | URL of your WUD API endpoint | `http://192.168.1.50:3000/api/containers` |

### Ports

The application exposes port 80 inside the container, which is mapped to port 2080 on the host by default. You can change this in the `docker-compose.yml` file:

```yaml
ports:
  - "your-port:80"
```

### Volumes

The application uses a named volume for Nginx logs:

```yaml
volumes:
  - nginx_logs:/var/log/nginx
```

## Customization

### Nginx Configuration

The Nginx configuration is stored in `docker/default.conf.template`. This template file uses environment variables (like `${WUD_API_URL}`) which are automatically replaced when the container starts.

### Frontend Customization

You can customize the look and feel by modifying the files in the `app/static` directory:

- `app/static/css/styles.css`: Main stylesheet
- `app/static/js/main.js`: Main JavaScript file
- `app/static/images/logo.png`: Application logo
- `app/static/images/favicon.ico`: Browser favicon

## Troubleshooting

### Container fails to start

If the container fails to start, check the logs:

```bash
docker-compose logs versionvault
```

Common issues include:
- Incorrect WUD API URL
- Network connectivity issues between VersionVault and WUD
- Permission issues with volumes

### Cannot connect to WUD API

Make sure your WUD instance is running and accessible from the VersionVault container. You may need to adjust your network settings or firewall rules.

## Contributing

Since I'm not a programmer, contributions are welcome in the form of:

-   Bug reports
-   Feature requests
-   Suggestions for improvements

## License

[MIT License](LICENSE)

## Acknowledgements

-   [WUD (What's Up Docker)](https://github.com/fmartinou/whats-up-docker) for providing the API.
-   [Claude 3.5](https://www.anthropic.com/claude) for assistance in developing this application.
-   [Nginx](https://nginx.org/) for the web server.
-   [Traefik](https://traefik.io/) for the reverse proxy.

---

**Last checked:** Apr 4, 2025, 09:11:32 PM
```
