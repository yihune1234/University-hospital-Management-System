-- Sample Pharmacy Inventory Data
-- Run this to populate the pharmacy_inventory table with sample drugs

USE University_Clinic_Management_System;

-- Clear existing data (optional)
-- DELETE FROM pharmacy_inventory;

-- Insert common medications
INSERT INTO pharmacy_inventory (drug_name, brand, batch_number, stock_quantity, unit, expiry_date) VALUES
-- Pain Relief
('Paracetamol 500mg', 'Panadol', 'BATCH001', 500, 'tablets', '2026-12-31'),
('Ibuprofen 400mg', 'Advil', 'BATCH002', 300, 'tablets', '2026-06-30'),
('Aspirin 100mg', 'Bayer', 'BATCH003', 400, 'tablets', '2026-09-30'),
('Diclofenac 50mg', 'Voltaren', 'BATCH004', 200, 'tablets', '2026-08-31'),

-- Antibiotics
('Amoxicillin 500mg', 'Amoxil', 'BATCH005', 250, 'capsules', '2026-03-31'),
('Azithromycin 250mg', 'Zithromax', 'BATCH006', 150, 'tablets', '2026-05-31'),
('Ciprofloxacin 500mg', 'Cipro', 'BATCH007', 180, 'tablets', '2026-07-31'),
('Metronidazole 400mg', 'Flagyl', 'BATCH008', 200, 'tablets', '2026-04-30'),

-- Gastrointestinal
('Omeprazole 20mg', 'Prilosec', 'BATCH009', 300, 'capsules', '2026-11-30'),
('Ranitidine 150mg', 'Zantac', 'BATCH010', 250, 'tablets', '2026-10-31'),
('Metoclopramide 10mg', 'Reglan', 'BATCH011', 150, 'tablets', '2026-08-31'),

-- Antihistamines
('Cetirizine 10mg', 'Zyrtec', 'BATCH012', 400, 'tablets', '2026-12-31'),
('Loratadine 10mg', 'Claritin', 'BATCH013', 350, 'tablets', '2026-09-30'),
('Chlorpheniramine 4mg', 'Piriton', 'BATCH014', 200, 'tablets', '2026-06-30'),

-- Cough & Cold
('Dextromethorphan Syrup', 'Robitussin', 'BATCH015', 100, 'bottles', '2026-05-31'),
('Guaifenesin 200mg', 'Mucinex', 'BATCH016', 180, 'tablets', '2026-07-31'),

-- Vitamins & Supplements
('Vitamin C 1000mg', 'Nature Made', 'BATCH017', 500, 'tablets', '2027-12-31'),
('Multivitamin', 'Centrum', 'BATCH018', 300, 'tablets', '2027-06-30'),
('Vitamin D3 1000IU', 'Nature Made', 'BATCH019', 400, 'capsules', '2027-09-30'),
('Folic Acid 5mg', 'Generic', 'BATCH020', 250, 'tablets', '2027-03-31'),

-- Cardiovascular
('Amlodipine 5mg', 'Norvasc', 'BATCH021', 200, 'tablets', '2026-08-31'),
('Atenolol 50mg', 'Tenormin', 'BATCH022', 180, 'tablets', '2026-07-31'),
('Atorvastatin 20mg', 'Lipitor', 'BATCH023', 150, 'tablets', '2026-10-31'),

-- Diabetes
('Metformin 500mg', 'Glucophage', 'BATCH024', 300, 'tablets', '2026-11-30'),
('Glibenclamide 5mg', 'Daonil', 'BATCH025', 200, 'tablets', '2026-09-30'),

-- Respiratory
('Salbutamol Inhaler', 'Ventolin', 'BATCH026', 80, 'inhalers', '2026-06-30'),
('Prednisolone 5mg', 'Generic', 'BATCH027', 150, 'tablets', '2026-08-31'),

-- Topical
('Hydrocortisone Cream 1%', 'Cortaid', 'BATCH028', 100, 'tubes', '2026-12-31'),
('Clotrimazole Cream 1%', 'Lotrimin', 'BATCH029', 80, 'tubes', '2026-09-30'),
('Mupirocin Ointment 2%', 'Bactroban', 'BATCH030', 60, 'tubes', '2026-07-31'),

-- Eye/Ear Drops
('Chloramphenicol Eye Drops', 'Generic', 'BATCH031', 50, 'bottles', '2026-03-31'),
('Ciprofloxacin Eye Drops', 'Ciloxan', 'BATCH032', 40, 'bottles', '2026-05-31'),

-- Emergency/First Aid
('Epinephrine Injection', 'EpiPen', 'BATCH033', 20, 'injections', '2026-12-31'),
('Dextrose 5% IV', 'Generic', 'BATCH034', 100, 'bags', '2026-08-31'),
('Normal Saline IV', 'Generic', 'BATCH035', 150, 'bags', '2026-09-30');

-- Display inserted data
SELECT 
    drug_id,
    drug_name,
    brand,
    stock_quantity,
    unit,
    expiry_date
FROM pharmacy_inventory
ORDER BY drug_name;

-- Show summary
SELECT 
    COUNT(*) as total_drugs,
    SUM(stock_quantity) as total_stock
FROM pharmacy_inventory;
