from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/bubble')
def bubble():
    return render_template('bubble.html')

@app.route('/selection')
def selection():
    return render_template('selection.html')

@app.route('/insertion')
def insertion():
    return render_template('insertion.html')

@app.route('/merge')
def merge():
    return render_template('merge.html')

@app.route('/quick')
def quick():
    return render_template('quick.html')

@app.route('/heap')
def heap():
    return render_template('heap.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)