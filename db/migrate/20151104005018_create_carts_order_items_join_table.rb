class CreateCartsOrderItemsJoinTable < ActiveRecord::Migration
  def self.up
    create_table :carts_order_items, :id => false do |t|
      t.integer :cart_id
      t.integer :order_item_id
    end

    add_index :carts_order_items, [:cart_id, :order_item_id]
  end

  def self.down
    drop_table :carts_order_items
  end
end
