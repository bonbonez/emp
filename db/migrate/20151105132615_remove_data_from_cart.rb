class RemoveDataFromCart < ActiveRecord::Migration
  def self.up
    remove_column :carts, :data
  end

  def self.down
    add_column :carts, :data, :string
  end
end
