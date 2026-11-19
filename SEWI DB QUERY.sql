

-- ============================================
-- 1. TABELA E PERDORUESVE
-- ============================================

CREATE TABLE perdoruesit (
    id INT IDENTITY(1,1) PRIMARY KEY,
    emri VARCHAR(50) NOT NULL,
    mbiemri VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    fjalekalimi VARCHAR(255) NOT NULL,
    roli VARCHAR(30) NOT NULL,
    telefoni INT,
);


-- ============================================
-- 2. TABELA E PROFILEVE TE OFRUESVE
-- ============================================

CREATE TABLE profilet_ofruesve (
    id INT IDENTITY(1,1) PRIMARY KEY,
    perdoruesi_id INT NOT NULL UNIQUE,
    emri_biznesit VARCHAR(100),
    pershkrimi TEXT,
    telefoni VARCHAR(30),
    adresa VARCHAR(150),
    qyteti VARCHAR(100),
    pervoja INT DEFAULT 0,

    FOREIGN KEY (perdoruesi_id)
    REFERENCES perdoruesit(id)
    ON DELETE CASCADE
);


-- ============================================
-- 3. TABELA E KATEGORIVE
-- ============================================

CREATE TABLE kategorite (
    id INT IDENTITY(1,1) PRIMARY KEY,
    emri VARCHAR(100) NOT NULL,
    pershkrimi TEXT
);


-- ============================================
-- 4. TABELA E SHERBIMEVE
-- ============================================

CREATE TABLE sherbimet (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ofruesi_id INT NOT NULL,
    kategoria_id INT NOT NULL,
    emri VARCHAR(100) NOT NULL,
    pershkrimi TEXT,
    cmimi DECIMAL(10,2),
    qyteti VARCHAR(100) NOT NULL,
    adresa VARCHAR(150),
    fotografia VARCHAR(255),
    statusi VARCHAR(20) DEFAULT 'aktiv',
    data_publikimit DATETIME2 NOT NULL DEFAULT SYSDATETIME()

    FOREIGN KEY (ofruesi_id)
    REFERENCES perdoruesit(id)
    ON DELETE CASCADE,

    FOREIGN KEY (kategoria_id)
    REFERENCES kategorite(id)
    
);


-- ============================================
-- 5. TABELA E VLERESIMEVE DHE KOMENTEVE
-- ============================================

CREATE TABLE vleresimet (
    id INT IDENTITY(1,1) PRIMARY KEY,
    klienti_id INT NOT NULL,
    sherbimi_id INT NOT NULL,
    vleresimi INT NOT NULL,
    komenti TEXT,
    data_vleresimit DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    FOREIGN KEY (klienti_id)
    REFERENCES perdoruesit(id),


    FOREIGN KEY (sherbimi_id)
    REFERENCES sherbimet(id),

    UNIQUE (klienti_id, sherbimi_id),

    CHECK (vleresimi BETWEEN 1 AND 5)
);


-- ============================================
-- 6. TABELA E KONTAKTEVE
-- ============================================

CREATE TABLE kontaktet (
    id INT IDENTITY(1,1) PRIMARY KEY,
    klienti_id INT NOT NULL,
    ofruesi_id INT NOT NULL,
    sherbimi_id INT,
    mesazhi TEXT NOT NULL,
    data_kontaktit DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    FOREIGN KEY (klienti_id)
    REFERENCES perdoruesit(id),

    FOREIGN KEY (ofruesi_id)
    REFERENCES perdoruesit(id),

    FOREIGN KEY (sherbimi_id)
    REFERENCES sherbimet(id)
);


-- ============================================
-- 7. TABELA E SHERBIMEVE TE PREFERUARA
-- ============================================

CREATE TABLE preferuarat (
    id INT IDENTITY(1,1) PRIMARY KEY,
    klienti_id INT NOT NULL,
    sherbimi_id INT NOT NULL,
    data_shtimit DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (klienti_id)
    REFERENCES perdoruesit(id),

    FOREIGN KEY (sherbimi_id)
    REFERENCES sherbimet(id),

    UNIQUE (klienti_id, sherbimi_id)
);


-- ============================================
-- SHTIMI I KATEGORIVE FILLESTARE
-- ============================================

INSERT INTO kategorite (emri, pershkrimi) VALUES
('Elektricist', 'Sherbime elektrike dhe instalime'),
('Hidraulik', 'Riparime dhe instalime hidraulike'),
('Mekanik', 'Riparimi dhe mirembajtja e automjeteve'),
('Pastrim', 'Sherbime pastrimi per shtepi dhe lokale'),
('Parukeri', 'Sherbime te flokeve dhe bukurise'),
('Renovime', 'Renovime dhe rregullime te shtepive'),
('Kopshtari', 'Mirembajtja e kopshteve'),
('Transport', 'Sherbime transporti dhe bartjeje'),
('Teknologji', 'Riparimi i kompjutereve dhe pajisjeve'),
('Fotografi', 'Sherbime fotografike');


-- ============================================
-- KONTROLLIMI I DATABAZES
-- ============================================
