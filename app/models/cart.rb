class Cart < ActiveRecord::Base
  before_save :generate_unique_cookie_id, :ensure_data_not_empty, :update_props

  has_and_belongs_to_many :order_items

  def add_item(item_id, weight, grind)
      items = order_items
      item = get_item(item_id, weight, grind)

      if item.present?
        item.quantity += 1
        item.save
        save
      else
        item = OrderItem.new(weight: weight, grind: grind)
        item.item = Item.find(item_id)
        item.quantity = 1
        item.save
        order_items.push(item)
        save
      end

      #update_props
  end

  def remove_item(item_id, weight, grind)
    item = get_item(item_id, weight, grind)
    if item
      if item.quantity > 1
        item.quantity -= 1
        item.save
      else
        delete_item(item_id, weight, grind)
      end
    end

    #self.update_props
  end

  def delete_item(item_id, weight, grind)
    item = get_item(item_id, weight, grind)
    if item
      item.destroy
      save
    end

    #update_props
  end

  def get_item(item_id, weight, grind)
    items = order_items
    item = items.where(item_id: item_id, weight: weight, grind: grind).last if items
    item
  end

  def update_props
    if self.order_items.count == 0
      self.amount = 0
      self.total_amount = 0
    else
      tmp = 0
      order_items.each do |i|
        item = i.item
        tmp += item.send("get_price_#{i.weight}") * i.quantity
      end
      self.amount = tmp
      self.total_amount = self.amount - (self.amount * self.discount / 100)
    end
    #save
  end

  def generate_unique_cookie_id
    if self.cookie_id.nil?
      self.cookie_id = loop do
        random_token = SecureRandom.urlsafe_base64(nil, false)
        break random_token unless Cart.exists?(cookie_id: random_token)
      end
    end
  end

  def ensure_data_not_empty
    if !self.amount.is_a?(Integer)
      self.amount = 0
    end

    if !self.discount.is_a?(Integer)
      self.discount = 0
    end

    if !self.total_amount.is_a?(Integer)
      self.total_amount = 0
    end
  end

  def is_empty?
    empty = self.order_items.count == 0
    empty
  end

  def data_dummy
    return {
      "items" => [],
      "total_price" => 0
    }
  end
end
