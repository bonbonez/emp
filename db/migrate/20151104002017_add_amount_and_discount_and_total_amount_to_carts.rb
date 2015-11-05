class AddAmountAndDiscountAndTotalAmountToCarts < ActiveRecord::Migration
  def self.up
    add_column :carts, :amount, :integer
    add_column :carts, :discount, :integer
    add_column :carts, :total_amount, :integer
  end

  def self.down
    remove_column :carts, :amount
    remove_column :carts, :discount
    remove_column :carts, :total_amount
  end
end
