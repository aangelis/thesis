### Postgres installation (db folder)

### Thesis application (app folder)

```
kubectl apply -f thesis-configmap.yaml
kubectl apply -f thesis-deployment.yaml
kubectl apply -f thesis-clip.yaml
```


#### install postgres
```bash
kubectl apply -f k8s/db/postgres-configmap.yaml 
kubectl apply -f k8s/db/postgres-volume.yaml 
kubectl apply -f k8s/db/postgres-pvc.yaml 
kubectl apply -f k8s/db/postgres-deployment.yaml 
kubectl apply -f k8s/db/postgres-service.yaml

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

