/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3085411453")

  // remove field
  collection.fields.removeById("json642663334")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "json773904695",
    "maxSize": 0,
    "name": "state",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3085411453")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "json642663334",
    "maxSize": 0,
    "name": "players",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "json773904695",
    "maxSize": 0,
    "name": "grid",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
