USE online_marketplace;
INSERT IGNORE INTO categories(category_name,description) VALUES ('Electronics','Gadgets and devices'),('Fashion','Clothing and accessories'),('Home','Home essentials'),('Books','Books and learning');
-- Create users through the registration API so passwords are securely hashed.
-- After registering a seller, approve it by setting status='active' in the admin workflow.
-- Create the first superadmin securely using the one-time bootstrap instructions in README.
