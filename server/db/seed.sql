-- Create a few example accounts
INSERT INTO accounts (id, titular, balance) VALUES
('11111111-1111-1111-1111-111111111111', 'Alice', 1000),
('22222222-2222-2222-2222-222222222222', 'Bob', 500),
('33333333-3333-3333-3333-333333333333', 'Charlie', 0)
ON CONFLICT DO NOTHING;

-- Add initial movements for seed accounts
INSERT INTO movements (account_id, type, amount, resulting_balance) VALUES
('11111111-1111-1111-1111-111111111111', 'deposit', 1000, 1000),
('22222222-2222-2222-2222-222222222222', 'deposit', 500, 500)
ON CONFLICT DO NOTHING;
