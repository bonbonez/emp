# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20151105132615) do

  create_table "carts", force: :cascade do |t|
    t.string   "cookie_id",    limit: 255
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.integer  "amount",       limit: 4
    t.integer  "discount",     limit: 4
    t.integer  "total_amount", limit: 4
  end

  create_table "carts_order_items", id: false, force: :cascade do |t|
    t.integer "cart_id",       limit: 4
    t.integer "order_item_id", limit: 4
  end

  add_index "carts_order_items", ["cart_id", "order_item_id"], name: "index_carts_order_items_on_cart_id_and_order_item_id", using: :btree

  create_table "countries", force: :cascade do |t|
    t.string   "name",              limit: 255
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
    t.string   "flag_file_name",    limit: 255
    t.string   "flag_content_type", limit: 255
    t.integer  "flag_file_size",    limit: 4
    t.datetime "flag_updated_at"
  end

  create_table "items", force: :cascade do |t|
    t.string   "name",                          limit: 255
    t.string   "methods",                       limit: 255
    t.integer  "price",                         limit: 4
    t.boolean  "is_published",                  limit: 1
    t.string   "url",                           limit: 255
    t.float    "rating",                        limit: 24
    t.text     "description",                   limit: 65535
    t.datetime "created_at",                                  null: false
    t.datetime "updated_at",                                  null: false
    t.string   "kind",                          limit: 255
    t.string   "specs",                         limit: 255
    t.string   "image_file_name",               limit: 255
    t.string   "image_content_type",            limit: 255
    t.integer  "image_file_size",               limit: 4
    t.datetime "image_updated_at"
    t.string   "image_plantation_file_name",    limit: 255
    t.string   "image_plantation_content_type", limit: 255
    t.integer  "image_plantation_file_size",    limit: 4
    t.datetime "image_plantation_updated_at"
    t.integer  "price_500",                     limit: 4
    t.integer  "price_1000",                    limit: 4
  end

  create_table "order_items", force: :cascade do |t|
    t.integer  "quantity",   limit: 4
    t.integer  "weight",     limit: 4
    t.string   "grind",      limit: 255
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
    t.integer  "item_id",    limit: 4
  end

  add_index "order_items", ["item_id"], name: "index_order_items_on_item_id", using: :btree

end
