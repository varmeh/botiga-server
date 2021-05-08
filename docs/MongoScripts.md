# Mongodb Scripts

## Create Collections

```
db.createCollection('helperData')
db.createCollection('apartments')
db.createCollection('sellers')
db.createCollection('users')
db.createCollection('orders')
```

## Apartments Collection

-   Add a unique index for apartment to avoid duplication
-   As `text` search does not support substring search, same index should be used with regex to mimic text search

```
db.apartments.createIndex({name: 1, area: 1, city: 1, pincode: 1}, {unique: true})
```

-   Add geospatial index for User Location Queriesn

```
db.apartments.createIndex({location: "2dsphere"})
```

## HelperData Collection

-   Add a document with array - `businessCategory`

## Sellers Collection

-   Add `unique` index to _contact.phone_ field

```
db.sellers.createIndex({"contact.phone": 1}, {unique: true})
```

## Users Collection

-   Add `unique` index to _phone_ field

```
db.users.createIndex({"contact.phone": 1}, {unique: true})
```

## Order Collection

Here, indexes are required to cater to user & seller scenarios.

### User Scenario:

-   `Scenario 1`: Find all orders placed by user.

To cater this scenario, just add an index on `buyer.id`

```
db.orders.createIndex({"buyer.id": 1, "createdAt": -1})
```

```
db.orders.createIndex({"buyer.phone": 1, "order.number": 1, "createdAt": -1})
```

### Seller Scenario:

-   `Scenario 1`: Find all orders placed to seller by date

    -   Group them into apartments
    -   Generate following information:
        -   Total Revenue Earned
        -   Total Orders Placed
        -   Total Revenue / community
        -   Total Orders / community

```
db.orders.createIndex({"seller.id": 1, "createdAt": -1, "apartment.id": 1})
```

-   `Scenario 2`: Return all deliveries specific to an apartment

```
db.orders.createIndex({"seller.id": 1, "order.expectedDeliveryDate": -1, "apartment.id": 1})
```
