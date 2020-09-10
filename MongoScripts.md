## Mongodb Scripts

### Apartment Collections

-   Add `unique` index to _name_ field of apartments collection

```
db.apartments.createIndex({name: 1}, {unique: true})
```
