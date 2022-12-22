# <Tutorial Name>

This repository is the codebase of tutorial [Implement SSO in Medusa](https://github.com/carpad88/medusa-server-passwordless.git).

[Medusa Documentation](https://docs.medusajs.com/) | [Medusa Website](https://medusajs.com/) | [Medusa Repository](https://github.com/medusajs/medusa)

## Medusa Version

This tutorial uses Medusa v1.7.0 It is not guaranteed that it will work with future releases.

## Prerequisites

- [Node.js at least v14](https://docs.medusajs.com/tutorial/set-up-your-development-environment#nodejs)
- PostgreSQL database. You can [follow this guide](https://docs.medusajs.com/tutorial/set-up-your-development-environment#postgresql).
- Redis as the event queue. You can [follow this guide](https://docs.medusajs.com/tutorial/set-up-your-development-environment#redis). 
- An email service to send emails. You can [follow this guide](https://docs.medusajs.com/add-plugins/sendgrid) to enable the Sendgrid plugin.
- A [Next.js starter](https://docs.medusajs.com/starters/nextjs-medusa-starter/) to test the new authentication flow added to the Medusa server.

## How to Install

1. Clone this repository:

```bash
git clone https://github.com/carpad88/medusa-server-passwordless.git
```

2. Change directory and install dependencies:

```bash
cd <directory>
npm install
```

3. Start Server:

```bash
npm start
```
