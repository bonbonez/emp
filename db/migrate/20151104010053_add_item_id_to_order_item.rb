class AddItemIdToOrderItem < ActiveRecord::Migration
  def self.up
    add_column :order_items, :item_id, :integer
    add_index  :order_items, :item_id
  end

  def self.down
    remove_column :order_items, :item_id
  end
end
