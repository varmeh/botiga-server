## Mongodb Scripts

### Apartments Collection

-   Add `unique` index to _name_ field

```
db.apartments.createIndex({name: 1}, {unique: true})
```

-   Add geospatial index for User Location Queriesn

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
db.users.createIndex({"contact.phone": 1}, {unique: true})
```

### Order Collection

Here, indexes are required to cater to user & seller scenarios.

#### User Scenario:

-   `Scenario 1`: Find all orders placed by user.

To cater this scenario, just add an index on `buyer.id`

```
db.orders.createIndex({"buyer.id": 1})
```

#### Seller Scenario:

-   `Scenario 1`: Find all orders placed to seller by date

    -   Group them into apartments
    -   Generate following information:
        -   Total Revenue Earned
        -   Total Orders Placed
        -   Total Revenue / community
        -   Total Orders / community

-   `Scenario 2`: Return all deliveries specific to an apartment

```
db.orders.createIndex({"order.expectedDeliveryDate": -1, "seller.id": 1})
```
