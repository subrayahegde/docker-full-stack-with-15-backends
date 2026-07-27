class CreateProducts < ActiveRecord::Migration[7.1]
  def change
    create_table :products, if_not_exists: true do |t|
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false
      t.timestamps
    end
  end
end
