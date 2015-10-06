{{method}} {{uri}}
{% for key, val in headers -%}
  {{key}}: {{val}}
{%- endfor -%}
{%- if body -%}
  {{body}}
{%- endif %}
