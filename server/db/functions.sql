CREATE OR REPLACE FUNCTION deposit_funds(
  p_account UUID, p_amount NUMERIC, p_idem_key TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'MONTO_INVALIDO';
  END IF;

  -- Idempotency check
  IF p_idem_key IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM processed_keys WHERE key = p_idem_key) THEN
      RETURN;
    END IF;
    INSERT INTO processed_keys(key) VALUES (p_idem_key);
  END IF;

  -- Lock row for concurrency
  PERFORM 1 FROM accounts WHERE id = p_account FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'CUENTA_INEXISTENTE';
  END IF;

  UPDATE accounts SET balance = balance + p_amount WHERE id = p_account;

  INSERT INTO movements(account_id, type, amount, resulting_balance)
  VALUES (p_account, 'deposit', p_amount, (SELECT balance FROM accounts WHERE id = p_account));
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION withdraw_funds(
  p_account UUID, p_amount NUMERIC, p_idem_key TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_balance NUMERIC;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'MONTO_INVALIDO';
  END IF;

  -- Idempotency check
  IF p_idem_key IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM processed_keys WHERE key = p_idem_key) THEN
      RETURN;
    END IF;
    INSERT INTO processed_keys(key) VALUES (p_idem_key);
  END IF;

  -- Lock row for concurrency
  PERFORM 1 FROM accounts WHERE id = p_account FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'CUENTA_INEXISTENTE';
  END IF;

  SELECT balance INTO v_balance FROM accounts WHERE id = p_account;
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'SALDO_INSUFICIENTE';
  END IF;

  UPDATE accounts SET balance = balance - p_amount WHERE id = p_account;

  INSERT INTO movements(account_id, type, amount, resulting_balance)
  VALUES (p_account, 'withdraw', p_amount, (SELECT balance FROM accounts WHERE id = p_account));
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION transfer_funds(
  p_from UUID, p_to UUID, p_amount NUMERIC, p_idem_key TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_from_balance NUMERIC;
BEGIN
  IF p_from = p_to THEN
    RAISE EXCEPTION 'ORIGEN_Y_DESTINO_IGUALES';
  END IF;
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'MONTO_INVALIDO';
  END IF;

  -- Idempotency check
  IF p_idem_key IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM processed_keys WHERE key = p_idem_key) THEN
      RETURN;
    END IF;
    INSERT INTO processed_keys(key) VALUES (p_idem_key);
  END IF;

  -- Lock both rows in fixed order to avoid deadlocks
  PERFORM 1 FROM accounts WHERE id IN (p_from, p_to) ORDER BY id FOR UPDATE;

  -- Verify existence and check balance
  SELECT balance INTO v_from_balance FROM accounts WHERE id = p_from;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'CUENTA_INEXISTENTE';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM accounts WHERE id = p_to) THEN
    RAISE EXCEPTION 'CUENTA_INEXISTENTE';
  END IF;

  IF v_from_balance < p_amount THEN
    RAISE EXCEPTION 'SALDO_INSUFICIENTE';
  END IF;

  UPDATE accounts SET balance = balance - p_amount WHERE id = p_from;
  UPDATE accounts SET balance = balance + p_amount WHERE id = p_to;

  INSERT INTO movements(account_id, type, amount, resulting_balance)
  VALUES (p_from, 'transfer_out', p_amount, (SELECT balance FROM accounts WHERE id = p_from));

  INSERT INTO movements(account_id, type, amount, resulting_balance)
  VALUES (p_to, 'transfer_in', p_amount, (SELECT balance FROM accounts WHERE id = p_to));
END;
$$ LANGUAGE plpgsql;
