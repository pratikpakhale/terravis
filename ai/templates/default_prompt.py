from string import Template

default_prompt_template = Template("""
$query
                                   
Strictly respond in JSON only and in the given schema instructions -
                                   
$schema_instructions""")
