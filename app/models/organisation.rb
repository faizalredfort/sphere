class Organisation < ActiveRecord::Base
  has_many :organisation_users, dependent: :destroy
  has_many :users, through: :organisation_users
  has_many :entity_types, dependent: :destroy
  has_many :entities, dependent: :destroy

  validates :name, presence: true, length: { maximum: 255 }
  validates :street, presence: true, length: { maximum: 255 }
  validates :house_number, presence: true, length: { maximum: 255 }
  validates :postal_code, presence: true, length: { maximum: 255 }
  validates :city, presence: true, length: { maximum: 255 }
  validates :country, presence: true, length: { maximum: 255 }

  def instance_name
    self.name
  end
end
