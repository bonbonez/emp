class AddAttachmentFlagToCountries < ActiveRecord::Migration
  def self.up
    change_table :countries do |t|
      t.attachment :flag
    end
  end

  def self.down
    remove_attachment :countries, :flag
  end
end
