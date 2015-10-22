class AddPrice500AndPrice1000ToItem < ActiveRecord::Migration
  def self.up
    add_column :items, :price_500, :integer
    add_column :items, :price_1000, :integer
  end

  def self.down
    remove_column :items, :price_500
    remove_column :items, :price_1000
  end
end
