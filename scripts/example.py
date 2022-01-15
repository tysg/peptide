def hello_world():
    print('hello world')
    return "hello world"

hello_world()

def read_file():
    with open("sitter-test.js", "rt") as f:
        l = f.read().splitlines()
    return l


print(read_file())


