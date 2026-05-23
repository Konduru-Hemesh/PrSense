export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const LANGUAGE_OPTIONS = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'C#', value: 'csharp' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'PHP', value: 'php' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'Swift', value: 'swift' },
  { label: 'SQL', value: 'sql' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'Shell', value: 'shell' },
  { label: 'Dart', value: 'dart' },
  { label: 'Scala', value: 'scala' },
  { label: 'Lua', value: 'lua' },
  { label: 'YAML', value: 'yaml' },
];

export const CATEGORY_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Bugs', value: 'bugs' },
  { label: 'Security', value: 'security' },
  { label: 'Performance', value: 'performance' },
  { label: 'Code Smells', value: 'codeSmells' },
];

export const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export const LANGUAGE_BOILERPLATES = {
  javascript: `const users = ['Ada', 'Grace'];

function renderProfile(user) {
  const html = '<div>' + user.name + '</div>';
  document.body.innerHTML = html;
}

renderProfile(users[0]);`,
  typescript: `type User = {
  id: number;
  name: string;
};

const users: User[] = [{ id: 1, name: 'Ada' }];

function renderProfile(user: User): string {
  return \`<div>\${user.name}</div>\`;
}

console.log(renderProfile(users[0]));`,
  python: `from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str

def render_profile(user: User) -> str:
    return f"<div>{user.name}</div>"

print(render_profile(User(1, 'Ada')))` ,
  java: `class Main {
    static String renderProfile(String name) {
        return "<div>" + name + "</div>";
    }

    public static void main(String[] args) {
        System.out.println(renderProfile("Ada"));
    }
}`,
  cpp: `#include <iostream>
#include <string>

std::string renderProfile(const std::string& name) {
    return "<div>" + name + "</div>";
}

int main() {
    std::cout << renderProfile("Ada") << std::endl;
    return 0;
}`,
  csharp: `using System;

class Program {
    static string RenderProfile(string name) {
        return $"<div>{name}</div>";
    }

    static void Main() {
        Console.WriteLine(RenderProfile("Ada"));
    }
}`,
  go: `package main

import "fmt"

func renderProfile(name string) string {
    return "<div>" + name + "</div>"
}

func main() {
    fmt.Println(renderProfile("Ada"))
}`,
  rust: `fn render_profile(name: &str) -> String {
    format!("<div>{}</div>", name)
}

fn main() {
    println!("{}", render_profile("Ada"));
}`,
  php: `<?php
function renderProfile(string $name): string {
    return "<div>{$name}</div>";
}

echo renderProfile('Ada');`,
  ruby: `def render_profile(name)
  "<div>#{name}</div>"
end

puts render_profile('Ada')`,
  kotlin: `fun renderProfile(name: String): String {
    return "<div>$name</div>"
}

fun main() {
    println(renderProfile("Ada"))
}`,
  swift: `func renderProfile(name: String) -> String {
    return "<div>\(name)</div>"
}

print(renderProfile(name: "Ada"))`,
  sql: `SELECT id, name
FROM users
WHERE active = 1;`,
  html: `<!doctype html>
<html>
  <body>
    <div id="app">Hello</div>
  </body>
</html>`,
  css: `.card {
  display: flex;
  align-items: center;
  justify-content: center;
}`, 
  shell: `#!/usr/bin/env bash
echo "Hello from PRSense"`,
  dart: `void main() {
  final name = 'Ada';
  print('<div>$name</div>');
}`,
  scala: `object Main extends App {
  def renderProfile(name: String): String = s"<div>$name</div>"
  println(renderProfile("Ada"))
}`,
  lua: `local function render_profile(name)
  return "<div>" .. name .. "</div>"
end

print(render_profile("Ada"))`,
  yaml: `name: PRSense
version: 1.0.0
enabled: true`,
};

export const DEFAULT_SNIPPET = LANGUAGE_BOILERPLATES[LANGUAGE_OPTIONS[0]?.value || 'javascript'];

export const DEMO_SUMMARY = 'PRSense combines instant static checks with Gemini-powered semantic review so teams get sub-second feedback and deep intelligence in one workflow.';
