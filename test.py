import json
import sys
import resource

def main(input_data):
    print('Debug: input_data =', input_data)
    number = input_data.get('number', 0)  # Get 'number' from input, default to 0
    print('Debug: number =', number)
    squared = number * number
    print('Debug: squared =', squared)
    result = {'squared': squared}
    print('Debug: result =', result)
    return result

input_data = {'number': 5}  # Example input
result = main(input_data)
usage = resource.getrusage(resource.RUSAGE_SELF)
print(json.dumps({
    'result': result,
    'metrics': {
        'memory': usage.ru_maxrss,
        'cpu': usage.ru_utime + usage.ru_stime
    }
}))
