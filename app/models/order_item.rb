class OrderItem < ActiveRecord::Base
    after_initialize :set_default_values

    has_and_belongs_to_many :carts
    belongs_to :item

    def set_default_values
      if !self.quantity.is_a?(Integer)
        self.quantity = 0
      end

      if !self.weight.is_a?(Integer)
        self.weight = 0
      end
    end
end
