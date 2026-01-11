
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');


const app = express();
app.use(cors()); 
app.use(express.json()); 

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'inpt_internship_hub'
});


db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à MySQL :', err);
        return;
    }
    console.log('Bravo ! Node.js est connecté à ta base MySQL.');
});

app.get('/api/offers', (req, res) => {
    const sql = "SELECT * FROM offers";
    db.query(sql, (err, data) => {
        if (err) {
            console.error("Erreur lors de la récupération :", err);
            return res.status(500).json(err);
        }
        return res.json(data);
    });
});

app.post('/api/offers', (req, res) => {
    const { title, type, filiere, description, company_name, company_id } = req.body;
    
    const sql = "INSERT INTO offers (title, type, filiere, description, company_name, company_id) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [title, type, filiere, description, company_name, company_id], (err, result) => {
        if (err) {
            console.error("Erreur lors de l'insertion :", err);
            return res.status(500).json(err);
        }
        res.json({ message: "Offre publiée avec succès !", id: result.insertId });
    });
});

app.post('/api/login', (req, res) => {
  
    let { id, password } = req.body;
    
    const numericId = parseInt(id); 

    const sql = "SELECT id, full_name, role FROM users WHERE id = ? AND password = ?";
    
    db.query(sql, [numericId, password], (err, results) => {
        if (err) {
            console.error("Erreur SQL :", err);
            return res.status(500).json(err);
        }
        
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.json({ success: false, message: "Identifiant ou mot de passe incorrect" });
        }
    });
});

app.put('/api/offers/:id', (req, res) => {
    const { title, type, filiere, description } = req.body;
    const offerId = req.params.id;
    
    const sql = "UPDATE offers SET title = ?, type = ?, filiere = ?, description = ? WHERE id = ?";
    
    db.query(sql, [title, type, filiere, description, offerId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Offre mise à jour !" });
    });
});

app.post('/api/applications', (req, res) => {
    
    const { offer_id, student_id, cv_url, motivation_text } = req.body;
    
    
    const sql = "INSERT INTO applications (offer_id, student_id, cv_url, motivation_text, status) VALUES (?, ?, ?, ?, 'En attente')";
    
    db.query(sql, [offer_id, student_id, cv_url, motivation_text], (err, result) => {
        if (err) {
            console.error("Erreur MySQL :", err);
            return res.status(500).json(err);
        }
        res.json({ success: true, message: "Candidature enregistrée avec succès !" });
    });
});

app.get('/api/applications/company/:companyId', (req, res) => {
    const companyId = req.params.companyId;
    
    
    const sql = `
        SELECT 
            a.id AS app_id, 
            u.full_name AS student_name, 
            u.filiere AS student_filiere, 
            o.title AS offer_title, 
            a.applied_at AS app_date
        FROM applications a
        JOIN users u ON a.student_id = u.id
        JOIN offers o ON a.offer_id = o.id
        WHERE o.company_id = ?`;

    db.query(sql, [companyId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.put('/api/applications/:id/status', (req, res) => {
    const appId = req.params.id;
    const { status } = req.body; 

    const sql = "UPDATE applications SET status = ? WHERE id = ?";
    
    db.query(sql, [status, appId], (err, result) => {
        if (err) {
            console.error("Erreur SQL lors de la mise à jour :", err);
            return res.status(500).json(err);
        }
        res.json({ success: true, message: `Statut mis à jour : ${status}` });
    });
});

app.get('/api/admin/students', (req, res) => {
    
    const sql = "SELECT id, full_name, filiere FROM users WHERE role = 'student'";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erreur SQL Admin:", err);
            return res.status(500).json(err);
        }
        res.json(results);
    });
});
app.put('/api/admin/save-grade', (req, res) => {
    const { studentId, note } = req.body;
    const sql = "UPDATE conventions SET note = ? WHERE student_id = ?";
    
    db.query(sql, [note, studentId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: "Note mise à jour !" });
    });
});
app.get('/api/admin/conventions', (req, res) => {
    const sql = `
        SELECT c.id, u.full_name AS student_name, c.company_name, c.file_path, c.status, c.note 
        FROM conventions c
        JOIN users u ON c.student_id = u.id`;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});
app.put('/api/admin/sign-convention/:id', (req, res) => {
    const convId = req.params.id;
    const sql = "UPDATE conventions SET status = 'Signée', signed_at = NOW() WHERE id = ?";
    
    db.query(sql, [convId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: "Convention signée !" });
    });
});

app.delete('/api/offers/:id', (req, res) => {
    const offerId = req.params.id;
    const sql = "DELETE FROM offers WHERE id = ?";
    
    db.query(sql, [offerId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: "Offre supprimée avec succès !" });
    });
});


app.listen(3000, () => {
    console.log('Serveur en attente sur http://localhost:3000');
});