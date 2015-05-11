class AddAttachmentImagePlantationToItems < ActiveRecord::Migration
  def self.up
    change_table :items do |t|
      t.attachment :image_plantation
    end
  end

  def self.down
    remove_attachment :items, :image_plantation
  end
end
