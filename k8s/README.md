### Postgres installation (db folder)

#### install helm


```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```
Link
* [install helm](https://helm.sh/docs/intro/install/)
#### enable helm in microk8s

```bash
microk8s enable helm3
```
#### add bitnami repo

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
```

#### install postgres
```bash
helm install postgres -f k8s/db/values.yaml bitnami/postgresql
```

```
microk8s.helm3 repo add bitnami https://charts.bitnami.com/bitnami
microk8s.helm3 install postgres -f values.yaml bitnami/postgresql
```


### mailhog (mailhog folder)

hostname
```
mailhog.email.svc.cluster.local
```

web interface endpoint
```
curl http://mailhog.email.svc.cluster.local:8025
```

installation
```
microk8s.helm3  repo add codecentric https://codecentric.github.io/helm-charts
microk8s.helm3  repo update
kubectl --namespace email get svc mailhog -o=jsonpath="{.spec.ports[?(@.name=='http')].nodePort}"
microk8s.helm3 install mailhog codecentric/mailhog -n email --create-namespace --set service.type=NodePort
node_ip=$(kubectl get nodes -o=jsonpath='{.items[0].status.addresses[0].address}')
web_port=$(kubectl --namespace email get svc mailhog -o=jsonpath="{.spec.ports[?(@.name=='http')].nodePort}")
smtp_port=$(kubectl --namespace email get svc mailhog -o=jsonpath="{.spec.ports[?(@.name=='tcp-smtp')].nodePort}")
echo "MailHog Web UI at http://$node_ip:$web_port"
echo "MailHog SMTP port at $node_ip:$smtp_port"
k apply -f mailhog/mailhog-external-service.yaml
```
