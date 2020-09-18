## Mongodb Scripts

### Apartments Collection

-   Add `unique` index to _name_ field

```
db.apartments.createIndex({name: 1}, {unique: true})
```

-   Add geospatial index

```
db.apartments.createIndex({location: "2dsphere"})
```

### Sellers Collection

-   Add `unique` index to _contact.phone_ field

```
db.sellers.createIndex({"contact.phone": 1}, {unique: true})
```

### Users Collection

-   Add `unique` index to _phone_ field

```
db.users.createIndex({"phone": 1}, {unique: true})
```
