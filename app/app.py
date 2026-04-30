from flask import Flask, redirect, render_template, request, url_for, jsonify
from flask_cors import CORS
import mysql.connector
import os
import time
app = Flask(__name__)
CORS(app)

DB_HOST = os.getenv('DB_HOST', 'mysql-service')
DB_NAME = os.getenv('DB_NAME', 'petvida')
DB_USER = os.getenv('DB_USER', 'aluno')
DB_PASSWORD = os.getenv('DB_PASSWORD', '123456')

def conectar_db():
    tentativas = 10
    while tentativas > 0:
        try:
            conexao = mysql.connector.connect(
                host='127.0.0.1',
                database='petvida',
                user='aluno',
                password='123456'
            )
            return conexao
        except mysql.connector.Error as err:
            tentativas -= 1
            time.sleep(3)
    return None


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/cadastro-pet', methods=['POST'])
def cadastro_pet():
    dados = request.get_json()

    conexao = conectar_db()
    if conexao is None:
        return jsonify({'erro': 'Falha ao conectar ao banco de dados'}), 500

    try:
        cursor = conexao.cursor()
        sql = "INSERT INTO pets (nome, tipo, idade, id_cliente) VALUES (%s, %s, %s, %s)"
        valores = (dados['nome'], dados['tipo'], dados['idade'], dados['id_cliente'])
        cursor.execute(sql, valores)
        conexao.commit()
        id_inserido = cursor.lastrowid
        return jsonify({'mensagem': 'Pet cadastrado com sucesso', 'id_pet': id_inserido}), 201
    except mysql.connector.Error as err:
        return jsonify({'erro': str(err)}), 500
    finally:
        cursor.close()
        conexao.close()


@app.route('/cadastro-cliente', methods=['POST'])
def cadastro_cliente():
    dados = request.get_json()

    conexao = conectar_db()
    if conexao is None:
        return jsonify({'erro': 'Falha ao conectar ao banco de dados'}), 500

    try:
        cursor = conexao.cursor()
        sql = "INSERT INTO clientes (nome, telefone, email) VALUES (%s, %s, %s)"
        valores = (dados['nome'], dados['telefone'], dados['email'])
        cursor.execute(sql, valores)
        conexao.commit()
        id_inserido = cursor.lastrowid
        return jsonify({'mensagem': 'Cliente cadastrado com sucesso', 'id_cliente': id_inserido}), 201
    except mysql.connector.Error as err:
        return jsonify({'erro': str(err)}), 500
    finally:
        cursor.close()
        conexao.close()


@app.route('/cadastro-fornecedor', methods=['POST'])
def cadastro_fornecedor():
    dados = request.get_json()

    conexao = conectar_db()
    if conexao is None:
        return jsonify({'erro': 'Falha ao conectar ao banco de dados'}), 500

    try:
        cursor = conexao.cursor()
        sql = "INSERT INTO fornecedores (nome, telefone, email, produtos) VALUES (%s, %s, %s, %s)"
        valores = (dados['nome'], dados['telefone'], dados['email'], dados.get('produtos'))
        cursor.execute(sql, valores)
        conexao.commit()
        id_inserido = cursor.lastrowid
        return jsonify({'mensagem': 'Fornecedor cadastrado com sucesso', 'id_fornecedor': id_inserido}), 201
    except mysql.connector.Error as err:
        return jsonify({'erro': str(err)}), 500
    finally:
        cursor.close()
        conexao.close()


@app.route('/cadastro-produto', methods=['POST'])
def cadastro_produto():
    dados = request.get_json()

    conexao = conectar_db()
    if conexao is None:
        return jsonify({'erro': 'Falha ao conectar ao banco de dados'}), 500

    try:
        cursor = conexao.cursor()
        sql = "INSERT INTO produtos (nome, descricao, preco, estoque, id_fornecedor) VALUES (%s, %s, %s, %s, %s)"
        valores = (dados['nome'], dados['descricao'], dados['preco'], dados['estoque'], dados['id_fornecedor'])
        cursor.execute(sql, valores)
        conexao.commit()
        id_inserido = cursor.lastrowid
        return jsonify({'mensagem': 'Produto cadastrado com sucesso', 'id_produto': id_inserido}), 201
    except mysql.connector.Error as err:
        return jsonify({'erro': str(err)}), 500
    finally:
        cursor.close()
        conexao.close()


@app.route('/cadastro-servico', methods=['POST'])
def cadastro_servico():
    dados = request.get_json()

    conexao = conectar_db()
    if conexao is None:
        return jsonify({'erro': 'Falha ao conectar ao banco de dados'}), 500

    try:
        cursor = conexao.cursor()
        sql = "INSERT INTO servico (tipo_servico, data, valor, id_pet) VALUES (%s, %s, %s, %s)"
        valores = (dados['tipo_servico'], dados['data'], dados['valor'], dados['id_pet'])
        cursor.execute(sql, valores)
        conexao.commit()
        id_inserido = cursor.lastrowid
        return jsonify({'mensagem': 'Serviço cadastrado com sucesso', 'id_servico': id_inserido}), 201
    except mysql.connector.Error as err:
        return jsonify({'erro': str(err)}), 500
    finally:
        cursor.close()
        conexao.close()


@app.route('/cadastro-venda', methods=['POST'])
def cadastro_venda():
    dados = request.get_json()

    conexao = conectar_db()
    if conexao is None:
        return jsonify({'erro': 'Falha ao conectar ao banco de dados'}), 500

    try:
        cursor = conexao.cursor()
        sql = "INSERT INTO vendas (quantidade, data, valor, id_produto, id_cliente) VALUES (%s, %s, %s, %s, %s)"
        valores = (dados['quantidade'], dados['data'], dados['valor'], dados['id_produto'], dados['id_cliente'])
        cursor.execute(sql, valores)
        conexao.commit()
        id_inserido = cursor.lastrowid
        return jsonify({'mensagem': 'Venda cadastrada com sucesso', 'id_venda': id_inserido}), 201
    except mysql.connector.Error as err:
        return jsonify({'erro': str(err)}), 500
    finally:
        cursor.close()
        conexao.close()


@app.route('/pets', methods=['GET'])
def listar_pets():
    conexao = conectar_db()
    if conexao is None:
        return jsonify({'erro': 'Falha ao conectar ao banco de dados'}), 500

    try:
        cursor = conexao.cursor(dictionary=True)
        cursor.execute("SELECT * FROM pets")
        pets = cursor.fetchall()
        return jsonify(pets), 200
    except mysql.connector.Error as err:
        return jsonify({'erro': str(err)}), 500
    finally:
        cursor.close()
        conexao.close()


@app.route('/clientes', methods=['GET'])
def listar_clientes():
    conexao = conectar_db()
    if conexao is None:
        return jsonify({'erro': 'Falha ao conectar ao banco de dados'}), 500

    try:
        cursor = conexao.cursor(dictionary=True)
        cursor.execute("SELECT * FROM clientes")
        clientes = cursor.fetchall()
        return jsonify(clientes), 200
    except mysql.connector.Error as err:
        return jsonify({'erro': str(err)}), 500
    finally:
        cursor.close()
        conexao.close()


@app.route('/fornecedores', methods=['GET'])
def listar_fornecedores():
    conexao = conectar_db()
    if conexao is None:
        return jsonify({'erro': 'Falha ao conectar ao banco de dados'}), 500

    try:
        cursor = conexao.cursor(dictionary=True)
        cursor.execute("SELECT * FROM fornecedores")
        fornecedores = cursor.fetchall()
        return jsonify(fornecedores), 200
    except mysql.connector.Error as err:
        return jsonify({'erro': str(err)}), 500
    finally:
        cursor.close()
        conexao.close()


@app.route('/produtos', methods=['GET'])
def listar_produtos():
    conexao = conectar_db()
    if conexao is None:
        return jsonify({'erro': 'Falha ao conectar ao banco de dados'}), 500

    try:
        cursor = conexao.cursor(dictionary=True)
        cursor.execute("SELECT * FROM produtos")
        produtos = cursor.fetchall()
        return jsonify(produtos), 200
    except mysql.connector.Error as err:
        return jsonify({'erro': str(err)}), 500
    finally:
        cursor.close()
        conexao.close()


@app.route('/servicos', methods=['GET'])
def listar_servicos():
    conexao = conectar_db()
    if conexao is None:
        return jsonify({'erro': 'Falha ao conectar ao banco de dados'}), 500

    try:
        cursor = conexao.cursor(dictionary=True)
        cursor.execute("SELECT * FROM servico")
        servicos = cursor.fetchall()
        return jsonify(servicos), 200
    except mysql.connector.Error as err:
        return jsonify({'erro': str(err)}), 500
    finally:
        cursor.close()
        conexao.close()


@app.route('/vendas', methods=['GET'])
def listar_vendas():
    conexao = conectar_db()
    if conexao is None:
        return jsonify({'erro': 'Falha ao conectar ao banco de dados'}), 500

    try:
        cursor = conexao.cursor(dictionary=True)
        cursor.execute("SELECT * FROM vendas")
        vendas = cursor.fetchall()
        return jsonify(vendas), 200
    except mysql.connector.Error as err:
        return jsonify({'erro': str(err)}), 500
    finally:
        cursor.close()
        conexao.close()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)



