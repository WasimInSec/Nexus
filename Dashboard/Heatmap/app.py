from flask import Flask, render_template

app = Flask(__name__)

@app.route('/heatmap')
def heatmap():
    return render_template('heatmap.html')  # Serve the HTML heatmap

if __name__ == '__main__':
    app.run(debug=True, port=8080)
