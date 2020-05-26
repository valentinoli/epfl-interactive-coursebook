import pandas
import json

def read_raw(filename, subdir='raw'):
    """Reads the raw json data file @filename and returns it as a dict"""
    with open(f'../data/{subdir}/{filename}.json') as file:
        return json.load(file)
    
def write_processed_df(filename, dataframe, orient='index'):
    """Writes the @dataframe to a processed json data file @filename"""
    dataframe.to_json(f'../data/processed/{filename}.json', orient=orient, indent=4)

def write_processed_dict(filename, dictionary, subdir='processed'):
    """Writes the @dictionary to a processed json data file @filename"""
    with open(f'../data/{subdir}/{filename}.json', 'w') as json_file:
        json.dump(dictionary, json_file, indent=4)