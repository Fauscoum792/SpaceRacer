from flask import Flask, render_template, session, redirect, url_for, g, request, jsonify
from database import get_db, close_db
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from forms import RegistrationForm, LoginForm
from functools import wraps
from datetime import date

app = Flask(__name__)
app.teardown_appcontext(close_db)
app.config["SECRET_KEY"] = "<-,->,<-,->,up,down,up,down,a,b"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@app.route("/")
def index():
    print("menu called")
    return render_template("index.html")

@app.before_request
def load_logged_in_user():
    g.user = session.get("user_id", None)

def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if g.user is None:
            return redirect(url_for("login", next = request.url))
        return view(*args, **kwargs)
    return wrapped_view

@app.route("/register", methods = ["GET", "POST"])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        user_id = form.user_id.data
        password = form.password.data
        db = get_db()
        clash = db.execute("""
            SELECT * FROM users
            WHERE user_id = ?;""", (user_id,)).fetchone()
        if clash is not None:
            form.user_id.errors.append("User name has already been taken")
            return render_template("register.html", form=form)
        else:
            db.execute("""
                INSERT INTO users (user_id, password)
                VALUES (?, ?);""",
                (user_id, generate_password_hash(password)))
            db.commit()
            return redirect( url_for("login") )

    
    return render_template("register.html", form = form)

@app.route("/login", methods = ["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user_id = form.user_id.data
        password = form.password.data
        db = get_db()        
        user_in_db = db.execute("""
            SELECT * FROM users
            WHERE user_id = ?;""", (user_id,)).fetchone()
        if user_in_db is None:
            form.user_id.errors.append("No such user name!")
        elif not check_password_hash(user_in_db["password"], password):
            form.password.errors.append("Incorrect password!")
        else:
            session.clear()
            session["user_id"] = user_id
            session.modified = True
            next_page = request.args.get("next")
            if not next_page:
                next_page = url_for("index")
            return redirect(next_page)
    return render_template("login.html", form = form)

@app.route("/logout")
def logout():
    session.clear()
    session.modified = True
    return redirect( url_for("index"))


#https://flask.palletsprojects.com/en/stable/patterns/javascript/ making fetch request
@app.route("/uploadLap", methods=["POST"])
@login_required
def uploadLap():
    db = get_db()
    lap_time = request.json.get("lap_time")
    map = request.json.get("map")
    if not lap_time:
        return jsonify({"success": False, "message": "Missing data"})
    
    user_id = session["user_id"]
    db.execute("""
        INSERT INTO leaderboard (user_id, lap_time, map)
        VALUES (?, ?, ?);
    """, (user_id, lap_time, map))
    db.commit()
    return jsonify({"success": True, "lap_time": lap_time})

@app.route("/leaderboard")
def leaderboard():
    db = get_db()
    lBoard = db.execute("""
        SELECT user_id, map, lap_time
        FROM leaderboard
        ORDER BY map
    """).fetchall()
    return render_template("leaderboard.html", lBoard = lBoard)
    
    

#lazy redirects
@app.route("/playground")
def playground():
    print("platG called")
    return render_template("playground.html")

@app.route("/map")
def map():
    print("map called")
    return render_template("map.html")

@app.route("/racetrackMenu")
@login_required
def racetrackMenu():
    print("racetrack menu called")
    return render_template("track/racetrackMenu.html")

@app.route("/racetrack1")
def racetrack1():
    print("racetrack called")
    return render_template("track/racetrack1.html")

@app.route("/racetrack2")
def racetrack2():
    print("racetrack called")
    return render_template("track/racetrack2.html")

@app.route("/racetrack3")
def racetrack3():
    print("racetrack called")
    return render_template("track/racetrack3.html")

@app.route("/racetrack4")
def racetrack4():
    print("racetrack called")
    return render_template("track/racetrack4.html")

@app.route("/racetrack5")
def racetrack5():
    print("racetrack called")
    return render_template("track/racetrack5.html")



