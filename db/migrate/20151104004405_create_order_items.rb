class CreateOrderItems < ActiveRecord::Migration
  def change
    create_table :order_items do |t|
      t.integer :quantity
      t.integer :weight
      t.string :grind

      t.timestamps null: false
    end
  end
end
