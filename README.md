![Test status][tests]
<br />
<p align="center">
  <h3 align="center">petahoaxbot</h3>

  <p align="center">
      This little robot replies to links to the scam website *petakillsanimals* and discloses that they are funded by the Center for Consumer Freedom.
    <br />
    <a href="https://www.reddit.com/user/petahoaxbot/"><strong>Visit profile »</strong></a>
  </p>
</p>

![example](.github/example.png)

[tests]: https://github.com/vegans/petahoaxbot/workflows/CI/badge.svg

### Kubernetes

Create `kubeconfig.yml`

#### Deploy

`yarn kc apply -f kube.yml`

#### Create secrets from .env file

`yarn kc create secret generic petahoaxbot --from-env-file=.env`

